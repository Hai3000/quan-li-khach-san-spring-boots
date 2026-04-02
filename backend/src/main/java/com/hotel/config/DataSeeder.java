package com.hotel.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataSeeder không còn tự động tạo dữ liệu mẫu.
 * Hệ thống sẽ được khởi tạo bởi Admin thông qua Setup Wizard (/setup).
 * Xem: SystemController.java
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

        @Override
        public void run(String... args) throws Exception {
                // No-op: System initialized via /api/system/setup endpoint
        }
}
