package com.academic.backend.controller;

import com.academic.backend.dto.LabelDTO;
import com.academic.backend.security.CustomUserDetails;
import com.academic.backend.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    @GetMapping("/projects/{projectId}/labels")
    public ResponseEntity<List<LabelDTO>> getProjectLabels(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        return ResponseEntity.ok(labelService.getProjectLabels(projectId, userId));
    }

    @PostMapping("/projects/{projectId}/labels")
    public ResponseEntity<LabelDTO> createLabel(
            @PathVariable UUID projectId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        String name = request.get("name");
        String color = request.get("color");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labelService.createLabel(projectId, name, color, userId));
    }

    @DeleteMapping("/labels/{id}")
    public ResponseEntity<Void> deleteLabel(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        labelService.deleteLabel(id, userId);
        return ResponseEntity.noContent().build();
    }
}
