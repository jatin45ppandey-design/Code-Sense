package jatin.backend.Entity;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "repositories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "github_repo_id"}))
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "github_repo_id", nullable = false)
    private long githubRepoId;

    @Column(nullable = false, length = 255)
    private String owner;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "full_name", nullable = false, length = 512)
    private String fullName;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate;

    @Column(name = "default_branch", nullable = false, length = 255)
    private String defaultBranch = "main";

    @Column(length = 100)
    private String language;

    @Column(length = 2000)
    private String description;

    @Column(name = "html_url", length = 1024)
    private String htmlUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "index_status", nullable = false, length = 32)
    private IndexStatus indexStatus = IndexStatus.PENDING;

    @Column(name = "indexed_at")
    private Instant indexedAt;

    @Column(name = "indexed_commit_sha", length = 64)
    private String indexedCommitSha;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "chunk_count", nullable = false)
    private int chunkCount;

    @Column(name = "files_total", nullable = false)
    private int filesTotal;

    @Column(name = "files_processed", nullable = false)
    private int filesProcessed;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (indexStatus == null) {
            indexStatus = IndexStatus.PENDING;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
