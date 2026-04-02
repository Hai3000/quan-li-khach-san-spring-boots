package com.hotel.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    private String roomId;
    private String guestName;
    private String cccd;
    private String phone;
    private LocalDate checkOutDate;
    private LocalDate checkInDate; // Có thể để client gửi, hoặc server tự gán ngày hiện tại
}
