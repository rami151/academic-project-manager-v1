package com.academic.backend.ai;

import com.academic.backend.dto.TaskDTO;
import com.academic.backend.repository.GeminiGenerationRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.GeminiGeneration;
import com.academic.backend.shared.enums.GenerationStatus;
import com.academic.backend.shared.enums.Priority;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final GeminiGenerationRepository generationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String apiBaseUrl;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String modelName;
    private static final String SYSTEM_PROMPT = """
        Tu es un chef de projet expert en développement logiciel académique.
        Ton rôle est de décomposer un projet en tâches concrètes et réalistes.""";
    // Fixed: was "Le格式" (Chinese chars) - now "Le format"
    private static final String CONSTRAINT_PROMPT = """
        Réponds UNIQUEMENT en JSON valide sans markdown ni texte supplémentaire.
        Le format doit être: {"tasks": [{"title": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW", "estimatedDays": number}]}""";
    private static final int MIN_DESCRIPTION_LENGTH = 20;
    private static final int MAX_RETRIES = 2;
    private static final Set<Integer> NON_RETRYABLE_HTTP_STATUSES = Set.of(400, 401, 403, 404, 429);

    // Creates generation record without calling API - returns immediately
    public GeminiGeneration createGeneration(String description, UUID projectId, UUID userId) {
        log.info("Creating generation for project {} by user {}", projectId, userId);

        if (description == null || description.length() < MIN_DESCRIPTION_LENGTH) {
            log.error("Description too short: {} chars (min required: {})",
                description != null ? description.length() : 0, MIN_DESCRIPTION_LENGTH);
            throw new IllegalArgumentException("Description must be at least " + MIN_DESCRIPTION_LENGTH + " characters");
        }

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        GeminiGeneration generation = GeminiGeneration.builder()
            .project(project)
            .createdBy(user)
            .prompt(description)
            .status(GenerationStatus.PENDING)
            .retryCount(0)
            .build();
        generation = generationRepository.save(generation);
        log.info("Created GeminiGeneration with id {}", generation.getId());
        log.info("Groq model configured: {}", modelName);

        return generation;
    }

    // Async fire-and-forget - called from controller, runs in background thread
    @Async
    public void executeGeneration(UUID generationId) {
        callGeminiApi(generationId);
    }

    // Sync version - for regenerateTask that needs the result immediately
    public GeminiGeneration executeGenerationSync(UUID generationId) {
        callGeminiApi(generationId);
        return generationRepository.findById(generationId)
            .orElseThrow(() -> new IllegalArgumentException("Generation not found: " + generationId));
    }

    // Core API call with loop-based retry (fixes infinite recursion bug)
    private void callGeminiApi(UUID generationId) {
        log.info("Executing Groq API call for generation {}", generationId);

        // Fail fast if API key is missing
        if (apiKey == null || apiKey.isBlank()) {
            log.error("Groq API key is not configured");
            markGenerationFailed(generationId, "Groq API key is not configured", null);
            return;
        }

        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                GeminiGeneration generation = generationRepository.findById(generationId)
                    .orElseThrow(() -> new IllegalArgumentException("Generation not found: " + generationId));

                // Jackson handles JSON escaping - no manual sanitization needed
                String jsonRequest = buildRequestJson(generation.getPrompt());

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                // Groq uses Bearer token auth instead of query-param key
                headers.setBearerAuth(apiKey);
                HttpEntity<String> request = new HttpEntity<>(jsonRequest, headers);

                String url = String.format("%s/chat/completions", apiBaseUrl);
                log.debug("Calling Groq API (attempt {})", attempt + 1);

                ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class);

                String responseBody = response.getBody();
                String textResponse = extractTextFromResponse(responseBody);

                generation.setRawResponse(textResponse);
                generation.setStatus(GenerationStatus.DONE);
                generation.setTokensUsed(estimateTokens(textResponse));
                generation.setRetryCount(attempt);
                generation.setFailureReason(null);
                generation.setProviderStatusCode(null);
                generationRepository.save(generation);

                log.info("Generation {} completed successfully", generationId);
                return;

            } catch (RestClientResponseException e) {
                log.error("Generation attempt {} failed with Groq HTTP {}: {}", attempt + 1, e.getStatusCode(), e.getResponseBodyAsString());
                Integer providerStatusCode = e.getStatusCode().value();
                String failureReason = buildProviderFailureReason(providerStatusCode, e.getResponseBodyAsString());
                if (NON_RETRYABLE_HTTP_STATUSES.contains(providerStatusCode)) {
                    markGenerationFailed(generationId, failureReason, providerStatusCode);
                    return;
                }
                if (attempt >= MAX_RETRIES) {
                    log.error("Max retries reached for generation {}", generationId);
                    markGenerationFailed(generationId, failureReason, providerStatusCode);
                    return;
                }

                final int currentAttempt = attempt;
                generationRepository.findById(generationId).ifPresent(gen -> {
                    gen.setRetryCount(currentAttempt + 1);
                    generationRepository.save(gen);
                });
            } catch (ResourceAccessException e) {
                log.error("Generation attempt {} network/timeout error: {}", attempt + 1, e.getMessage());
                if (attempt >= MAX_RETRIES) {
                    log.error("Max retries reached for generation {}", generationId);
                    markGenerationFailed(generationId, "Network timeout while contacting Groq API", null);
                    return;
                }

                final int currentAttempt = attempt;
                generationRepository.findById(generationId).ifPresent(gen -> {
                    gen.setRetryCount(currentAttempt + 1);
                    generationRepository.save(gen);
                });
            } catch (Exception e) {
                log.error("Generation attempt {} failed: {}", attempt + 1, e.getMessage(), e);

                if (attempt >= MAX_RETRIES) {
                    log.error("Max retries reached for generation {}", generationId);
                    markGenerationFailed(generationId, "Unexpected AI provider error", null);
                    return;
                }

                // Save retry count to DB before next attempt (fixes infinite loop bug)
                final int currentAttempt = attempt;
                generationRepository.findById(generationId).ifPresent(gen -> {
                    gen.setRetryCount(currentAttempt + 1);
                    generationRepository.save(gen);
                });
            }
        }
    }

    private String buildRequestJson(String userInput) {
        try {
            // OpenAI-compatible messages format used by Groq
            Map<String, Object> systemMessage = Map.of(
                "role", "system",
                "content", SYSTEM_PROMPT + "\n" + CONSTRAINT_PROMPT
            );

            Map<String, Object> userMessage = Map.of(
                "role", "user",
                "content", userInput
            );

            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("model", modelName);
            requestMap.put("messages", new Object[]{systemMessage, userMessage});
            // Low temperature for consistent structured JSON output
            requestMap.put("temperature", 0.3);

            // Jackson handles all JSON escaping automatically
            return objectMapper.writeValueAsString(requestMap);
        } catch (Exception e) {
            log.error("Failed to build request JSON: {}", e.getMessage());
            throw new RuntimeException("Failed to build request", e);
        }
    }

    private String extractTextFromResponse(String jsonResponse) {
        try {
            // Groq uses OpenAI-compatible response: choices[0].message.content
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode choices = root.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No choices in response");
            }
            JsonNode message = choices.get(0).get("message");
            if (message == null) {
                throw new RuntimeException("No message in choice");
            }
            JsonNode content = message.get("content");
            if (content == null) {
                throw new RuntimeException("No content in message");
            }
            return content.asText();
        } catch (Exception e) {
            log.error("Failed to extract text from response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse API response", e);
        }
    }

    private int estimateTokens(String text) {
        return text.length() / 4;
    }

    private void updateGenerationStatus(UUID generationId, GenerationStatus status) {
        generationRepository.findById(generationId).ifPresent(gen -> {
            gen.setStatus(status);
            generationRepository.save(gen);
        });
    }

    private String buildProviderFailureReason(Integer statusCode, String responseBody) {
        if (statusCode == 404) {
            return String.format("Configured Groq model '%s' is unavailable", modelName);
        }
        if (statusCode == 429) {
            return "Groq API rate limit or quota exceeded";
        }
        if (responseBody != null && !responseBody.isBlank()) {
            return String.format("Groq API error %d", statusCode);
        }
        return String.format("Groq API request failed with status %d", statusCode);
    }

    private void markGenerationFailed(UUID generationId, String failureReason, Integer providerStatusCode) {
        generationRepository.findById(generationId).ifPresent(gen -> {
            gen.setStatus(GenerationStatus.FAILED);
            gen.setFailureReason(failureReason);
            gen.setProviderStatusCode(providerStatusCode);
            generationRepository.save(gen);
        });
    }

    public List<TaskDTO> parseTasksFromResponse(String jsonResponse) {
        log.debug("Parsing tasks from response");
        List<TaskDTO> tasks = new ArrayList<>();

        try {
            // Strip markdown code fences if LLM wraps response in ```json ... ```
            String cleaned = jsonResponse.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }

            JsonNode root = objectMapper.readTree(cleaned);
            JsonNode tasksArray = root.get("tasks");
            if (tasksArray == null || !tasksArray.isArray()) {
                log.warn("No 'tasks' array in response");
                return tasks;
            }

            for (JsonNode taskNode : tasksArray) {
                try {
                    String title = taskNode.has("title") ? taskNode.get("title").asText() : null;
                    Priority priority = taskNode.has("priority")
                        ? Priority.valueOf(taskNode.get("priority").asText())
                        : Priority.MEDIUM;
                    Integer estimatedDays = taskNode.has("estimatedDays")
                        ? taskNode.get("estimatedDays").asInt()
                        : 1;

                    if (title == null || title.isBlank()) {
                        log.warn("Skipping task with missing title");
                        continue;
                    }

                    TaskDTO dto = TaskDTO.builder()
                        .title(title)
                        .description(taskNode.has("description") ? taskNode.get("description").asText() : "")
                        .priority(priority)
                        .estimatedDays(estimatedDays != null ? estimatedDays : 1)
                        .build();
                    tasks.add(dto);

                } catch (Exception e) {
                    log.warn("Failed to parse task: {}", e.getMessage());
                }
            }

            log.info("Parsed {} tasks from response", tasks.size());

        } catch (Exception e) {
            log.error("Failed to parse tasks from response: {}", e.getMessage());
        }

        return tasks;
    }

    public GeminiGeneration retryGeneration(UUID generationId) {
        log.info("Retrying generation {}", generationId);

        GeminiGeneration generation = generationRepository.findById(generationId)
            .orElseThrow(() -> new IllegalArgumentException("Generation not found: " + generationId));

        if (generation.getStatus() != GenerationStatus.FAILED) {
            throw new IllegalArgumentException("Can only retry failed generations");
        }

        Integer retryCount = generation.getRetryCount() != null ? generation.getRetryCount() : 0;
        if (retryCount >= MAX_RETRIES) {
            throw new IllegalArgumentException("Maximum retries exceeded");
        }

        generation.setStatus(GenerationStatus.PENDING);
        generation.setRetryCount(retryCount);
        generation.setFailureReason(null);
        generation.setProviderStatusCode(null);
        generation = generationRepository.save(generation);

        callGeminiApi(generationId);

        return generationRepository.findById(generationId)
            .orElseThrow(() -> new IllegalArgumentException("Generation not found"));
    }
}