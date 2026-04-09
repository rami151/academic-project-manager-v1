package com.academic.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // Skip JWT filter for login/register endpoints only
        String requestUri = request.getRequestURI();
        if (requestUri.equals("/api/auth/login") || requestUri.equals("/api/auth/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract Authorization header
        final String authHeader = request.getHeader("Authorization");

        // Validate Bearer token presence
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extract JWT token
            final String jwt = authHeader.substring(7);

            // Extract username from token
            final String username = jwtUtil.extractUsername(jwt);

            // Check if username exists and no authentication in context yet
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load UserDetails from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Validate token against user details
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log error but don't block request
            log.error("JWT authentication failed: {}", e.getMessage());
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
