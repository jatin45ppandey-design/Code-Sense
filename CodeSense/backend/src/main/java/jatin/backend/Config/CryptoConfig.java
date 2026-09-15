package jatin.backend.Config;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.AesGcmBytesEncryptor;
import org.springframework.security.crypto.encrypt.BytesEncryptor;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

@Configuration
public class CryptoConfig {

    private static final String GCM_PREFIX = "gcm:";

    @Bean
    TextEncryptor tokenEncryptor(
            @Value("${app.token-encryption.password}") String password,
            @Value("${app.token-encryption.salt}") String salt) {
        BytesEncryptor authenticatedEncryptor = AesGcmBytesEncryptor
                .withPassword(password, salt)
                .build();
        TextEncryptor legacyEncryptor = legacyEncryptor(password, salt);

        return new TextEncryptor() {
            @Override
            public String encrypt(String text) {
                byte[] encrypted = authenticatedEncryptor.encrypt(
                        text.getBytes(StandardCharsets.UTF_8));
                return GCM_PREFIX + HexFormat.of().formatHex(encrypted);
            }

            @Override
            public String decrypt(String encryptedText) {
                if (!encryptedText.startsWith(GCM_PREFIX)) {
                    return legacyEncryptor.decrypt(encryptedText);
                }
                byte[] encrypted = HexFormat.of().parseHex(
                        encryptedText.substring(GCM_PREFIX.length()));
                return new String(authenticatedEncryptor.decrypt(encrypted), StandardCharsets.UTF_8);
            }
        };
    }

    @SuppressWarnings("deprecation")
    private static TextEncryptor legacyEncryptor(String password, String salt) {
        return Encryptors.text(password, salt);
    }
}
