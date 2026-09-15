package jatin.backend.Config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

class CryptoConfigTest {

    private static final String PASSWORD = "test-only-password";
    private static final String SALT = "0123456789abcdef";

    @Test
    void encryptsNewTokensWithGcmAndDecryptsThem() {
        TextEncryptor encryptor = new CryptoConfig().tokenEncryptor(PASSWORD, SALT);

        String encrypted = encryptor.encrypt("github-token");

        assertTrue(encrypted.startsWith("gcm:"));
        assertEquals("github-token", encryptor.decrypt(encrypted));
    }

    @Test
    @SuppressWarnings("deprecation")
    void decryptsTokensWrittenByTheLegacyEncryptor() {
        String legacy = Encryptors.text(PASSWORD, SALT).encrypt("existing-token");

        TextEncryptor encryptor = new CryptoConfig().tokenEncryptor(PASSWORD, SALT);

        assertEquals("existing-token", encryptor.decrypt(legacy));
    }
}
