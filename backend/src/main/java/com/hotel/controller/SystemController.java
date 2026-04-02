package com.hotel.controller;

import com.hotel.model.Role;
import com.hotel.model.User;
import com.hotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final UserRepository userRepository;

    /**
     * Kiểm tra hệ thống đã được khởi tạo chưa.
     * Frontend dùng endpoint này để quyết định redirect /setup hay /login.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean initialized = userRepository.count() > 0;
        return ResponseEntity.ok(Map.of("initialized", initialized));
    }

    /**
     * Khởi tạo hệ thống lần đầu: tạo tài khoản Admin đầu tiên.
     * Chỉ hoạt động khi DB chưa có user nào (trả 403 nếu đã có).
     */
    @PostMapping("/setup")
    public ResponseEntity<Map<String, String>> setup(@RequestBody SetupRequest request) {
        if (userRepository.count() > 0) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Hệ thống đã được khởi tạo. Không thể thực hiện lại."));
        }

        if (request.username() == null || request.username().isBlank() ||
                request.password() == null || request.password().isBlank() ||
                request.fullName() == null || request.fullName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Vui lòng điền đầy đủ thông tin quản trị viên."));
        }

        User admin = User.builder()
                .username(request.username().trim())
                .password(request.password())
                .fullName(request.fullName().trim())
                .role(Role.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);

        System.out.println("✅ Hệ thống đã được khởi tạo bởi Admin: " + request.username());

        return ResponseEntity.ok(Map.of("message", "Hệ thống đã được khởi tạo thành công!"));
    }

    record SetupRequest(String hotelName, String fullName, String username, String password) {
    }
}
