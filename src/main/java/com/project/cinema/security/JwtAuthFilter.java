package com.project.cinema.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    // OncePerRequestFilter = runs exactly once per HTTP request

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1 — Read the Authorization header
        // It looks like: "Bearer eyJhbGci....."
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token found — move on, SecurityConfig will block if endpoint is protected
            filterChain.doFilter(request, response);
            return;
        }

        // Step 2 — Extract token (remove "Bearer " prefix)
        String token = authHeader.substring(7);

        // Step 3 — Extract email from token
        String email = jwtUtil.extractEmail(token);

        // Step 4 — If email found and no authentication set yet
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Step 5 — Load user from DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Step 6 — Validate token
            if (jwtUtil.isTokenValid(token)) {

                // Step 7 — Set authentication in SecurityContext
                // After this line, any service can call SecurityContextHolder.getContext()
                // and get this user's details
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Step 8 — Continue to the actual controller
        filterChain.doFilter(request, response);
    }
}
