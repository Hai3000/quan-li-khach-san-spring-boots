package com.hotel.dto;

import com.hotel.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String username;
    private String fullName;
    private Role role;
    private String token; // Bỏ qua JWT cho demo đơn giản, ta chỉ trả về thông tin user
}
