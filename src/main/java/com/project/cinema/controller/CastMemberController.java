package com.project.cinema.controller;

import com.project.cinema.dto.CastMemberRequest;
import com.project.cinema.dto.CastMemberResponse;
import com.project.cinema.service.CastMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cast-members")
@RequiredArgsConstructor
public class CastMemberController {

    private final CastMemberService castMemberService;

    // GET /api/cast-members?page=0&size=10
    @GetMapping
    public ResponseEntity<Page<CastMemberResponse>> getAllCastMembers(
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(castMemberService.getAllCastMembers(pageable));
    }

    // GET /api/cast-members/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CastMemberResponse> getCastMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(castMemberService.getCastMemberById(id));
    }

    // GET /api/cast-members/search?q=tom
    @GetMapping("/search")
    public ResponseEntity<List<CastMemberResponse>> searchCastMembers(
            @RequestParam String q) {
        return ResponseEntity.ok(castMemberService.searchCastMembers(q));
    }

    // POST /api/cast-members — ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CastMemberResponse> createCastMember(
            @Valid @RequestBody CastMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(castMemberService.createCastMember(request));
    }

    // PUT /api/cast-members/{id} — ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CastMemberResponse> updateCastMember(
            @PathVariable Long id,
            @Valid @RequestBody CastMemberRequest request) {
        return ResponseEntity.ok(castMemberService.updateCastMember(id, request));
    }

    // DELETE /api/cast-members/{id} — ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCastMember(@PathVariable Long id) {
        castMemberService.deleteCastMember(id);
        return ResponseEntity.noContent().build(); // 204
    }
}
