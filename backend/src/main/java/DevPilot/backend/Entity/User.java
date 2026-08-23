package DevPilot.backend.Entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name="username", unique = true, nullable = false)
    private String username;

    @Column(name="avatar_url", length = 500)
    private String avatarUrl;

    @Column(name="github_id", unique = true, nullable = false)
    private Long githubId;

    @Column(name="github_username", unique = true, nullable = false)
    private String githubUsername;

    @Column(name="github_access_token", columnDefinition = "TEXT", nullable = false)
    private String githubAccessToken;

    @Column(name="github_token_scope", columnDefinition = "TEXT", nullable = false)
    private String githubTokenScope;

    @Column(name="created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
