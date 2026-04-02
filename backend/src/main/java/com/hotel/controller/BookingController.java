package com.hotel.controller;

import com.hotel.dto.BookingRequest;
import com.hotel.model.Booking;
import com.hotel.model.Invoice;
import com.hotel.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/checkin")
    public ResponseEntity<Booking> checkIn(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.checkIn(request));
    }

    @PostMapping("/{bookingId}/checkout")
    public ResponseEntity<Invoice> checkOut(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.checkOut(bookingId));
    }

    @GetMapping("/active/{roomId}")
    public ResponseEntity<Booking> getActiveBookingForRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(bookingService.getActiveBookingForRoom(roomId));
    }
}
