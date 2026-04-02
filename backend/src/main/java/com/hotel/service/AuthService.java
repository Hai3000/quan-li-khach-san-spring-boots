package com.hotel.service;

import com.hotel.dto.AuthResponse;
import com.hotel.dto.LoginRequest;
import com.hotel.model.User;
import com.hotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActive()) {
            throw new RuntimeException("User is deactivated");
        }

        // Demo đơn giản: so sánh trực tiếp (Thực tế nên dùng BCryptPasswordEncoder)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        user.setOnline(true);
        user.setLastActiveAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .token("dummy-jwt-token-" + user.getId())
                .build();
    }

    public void logout(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(false);
            user.setLastActiveAt(java.time.LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public void setOnline(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(true);
            user.setLastActiveAt(java.time.LocalDateTime.now());
            userRepository.save(user);
        });
    }
}
