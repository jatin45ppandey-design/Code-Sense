package jatin.backend.Service.github.indexing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jatin.backend.Service.ai.RagSettings;
import jatin.backend.Service.ai.EmbeddingProvider;


@Component
public class CodeChunker {
    private final TokenTextSplitter splitter;
    private final CodeFileFilter fileFilter;
    private final EmbeddingProvider embeddingProvider;

  
    public CodeChunker(
            @Value("${app.indexing.chunk-size:800}") int chunkSize,
            CodeFileFilter fileFilter,
            EmbeddingProvider embeddingProvider) {
        // Spring AI splits by tokens; ~4 characters per token is a reasonable default for code.
        int chunkTokens = Math.max(50, chunkSize / 4);

        this.splitter = TokenTextSplitter.builder()
                .withChunkSize(chunkTokens)
                .build();
        this.fileFilter = fileFilter;
        this.embeddingProvider = embeddingProvider;
    }

      public List<Document> chunkFile(
              String repositoryId,
              String owner,
              String repository,
              String branch,
              String filePath,
              String content) {
        if (content == null || content.isBlank()) {
            return List.of();
        }

        if (content.indexOf('\0') >= 0) {
            return List.of();
        }

        String language = fileFilter.detectLanguage(filePath);
        String header = "// File: " + filePath + "\n";

        Document source = new Document(
                header + content,
                baseMetadata(repositoryId, owner, repository, branch, filePath, language));
        List<Document> split = splitter.apply(List.of(source));

        return IntStream.range(0, split.size())
                .mapToObj(i -> withChunkIndex(
                        split.get(i), repositoryId, owner, repository, branch, filePath, language, i))
                .toList();
    }

      private Map<String, Object> baseMetadata(
              String repositoryId,
              String owner,
              String repository,
              String branch,
              String filePath,
              String language) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put(RagSettings.METADATA_REPOSITORY_ID, repositoryId);
        metadata.put(RagSettings.METADATA_OWNER, owner);
        metadata.put(RagSettings.METADATA_REPOSITORY, repository);
        metadata.put(RagSettings.METADATA_BRANCH, branch);
        metadata.put("filePath", filePath);
        metadata.put("language", language);
        metadata.put("embeddingProvider", embeddingProvider.name());
        metadata.put("embeddingModel", embeddingProvider.model());
        metadata.put("embeddingDimensions", embeddingProvider.dimensions());
        return metadata;
    }

     private Document withChunkIndex(
            Document chunk,
            String repositoryId,
            String owner,
            String repository,
            String branch,
            String filePath,
            String language,
            int chunkIndex) {
        Map<String, Object> metadata = new HashMap<>(chunk.getMetadata());
        metadata.put(RagSettings.METADATA_REPOSITORY_ID, repositoryId);
        metadata.put(RagSettings.METADATA_OWNER, owner);
        metadata.put(RagSettings.METADATA_REPOSITORY, repository);
        metadata.put(RagSettings.METADATA_BRANCH, branch);
        metadata.put("filePath", filePath);
        metadata.put("language", language);
        metadata.put("chunkIndex", chunkIndex);
        metadata.put("embeddingProvider", embeddingProvider.name());
        metadata.put("embeddingModel", embeddingProvider.model());
        metadata.put("embeddingDimensions", embeddingProvider.dimensions());
         return new Document(chunk.getText(), metadata);
            }
}
