package DevPilot.backend.Services;

import java.util.UUID;

import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import DevPilot.backend.Entity.User;
import DevPilot.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServices {
    public final UserRepository userRepository;
    public final TextEncryptor tokenEncrypter;

    @Transactional(readOnly = true)
    public User requiredById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public String decryptAccessToken(String encryptedAccessToken) {
        return tokenEncrypter.decrypt(encryptedAccessToken);
    }

    private static long Tolong(Object value){
        if (value instanceof Number number) {
            return number.longValue();
        } 
        return Long.parseLong(String.valueOf(value));
    }
}
