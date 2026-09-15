package jatin.backend.Service.ai;

public class RagSettings 
{
    public static final int TOP_K_CHUNKS=8;
    
    public static final long STREAM_TIMEOUT_MS=180_000L;

    public static final String METADATA_REPOSITORY_ID = "repositoryId";
    public static final String METADATA_OWNER = "owner";
    public static final String METADATA_REPOSITORY = "repository";
    public static final String METADATA_BRANCH = "branch";
    private RagSettings() 
    {
        // Prevent instantiation
    }
    
}
