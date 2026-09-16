package jatin.backend.DTO;

import jakarta.validation.constraints.NotBlank;

/** Request to add a GitHub repository by its canonical web URL. */
public record ImportRepositoryRequest(@NotBlank(message = "url is required") String url) {
}
