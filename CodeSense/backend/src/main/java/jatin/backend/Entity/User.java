package jatin.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Builder
public class User
{
    // Primary key generated automatically when a new user is saved.
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    // Unique GitHub account ID used to identify the signed-in user.
    @Column(name="githubid",unique=true ,nullable = false,length=100)
    private long githubId;
    // GitHub login name displayed for the account.
    @Column(name="githuusername",nullable = false,length=255)
    private String githubUsername;
    // Name selected by the user for display in the application.
    @Column(name="displayname",nullable = false,length=255)
    private String displayname;
    // Link to the user's GitHub profile image.
    // GitHub avatar URLs include a path and optional query parameters, so they
    // regularly exceed the original 100-character limit.
    @Column(name="avatarurl",nullable = false,length=1024)
    private String avatarUrl;
    // Encrypted GitHub OAuth access token used for GitHub API calls.
    // Encryptors.text adds an IV and hex-encodes the result. The encrypted
    // form of a GitHub access token is therefore much longer than the token.
    @Column(name="accesstoken",nullable = false,length=1024)
    private String accessToken;
    // OAuth permissions granted with the GitHub token.
    @Column(name="tokenscope",length=512)
    private String tokenscopes;
    // Time when this user record was first stored.
    @Column(name="createdAt",nullable = false,length=100)

    private Instant createdAt;
    /**
     * Sets the creation time automatically before a new user is inserted.
     */
    @PrePersist
    void onCreate()
    {
        if (createdAt == null)
        {
            createdAt = Instant.now();
        }
    }

}
