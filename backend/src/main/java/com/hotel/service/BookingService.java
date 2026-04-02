package com.hotel.service;

import com.hotel.dto.BookingRequest;
import com.hotel.model.Booking;
import com.hotel.model.BookingStatus;
import com.hotel.model.Invoice;
import com.hotel.model.Room;
import com.hotel.model.RoomStatus;
import com.hotel.repository.BookingRepository;
import com.hotel.repository.InvoiceRepository;
import com.hotel.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;

    public Booking checkIn(BookingRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new RuntimeException("Room is not available");
        }

        LocalDate checkIn = request.getCheckInDate() != null ? request.getCheckInDate() : LocalDate.now();
        LocalDate checkOut = request.getCheckOutDate();

        if (!checkOut.isAfter(checkIn)) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        long days = ChronoUnit.DAYS.between(checkIn, checkOut);
        double estimatedPrice = days * room.getPrice();

        Booking booking = Booking.builder()
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .guestName(request.getGuestName())
                .cccd(request.getCccd())
                .phone(request.getPhone())
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .estimatedPrice(estimatedPrice)
                .status(BookingStatus.ACTIVE)
                .build();

        bookingRepository.save(booking);

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return booking;
    }

    public Booking getActiveBookingForRoom(String roomId) {
        return bookingRepository.findByRoomIdAndStatus(roomId, BookingStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active booking for this room"));
    }

    public Invoice checkOut(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking already completed");
        }

        // Logic check-out
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setFinalPrice(booking.getEstimatedPrice()); // Đơn giản hóa, thực tế có thể có phụ thu
        bookingRepository.save(booking);

        // Update room status
        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setStatus(RoomStatus.CLEANING); // Or AVAILABLE
        roomRepository.save(room);

        // Generate invoice
        Invoice invoice = Invoice.builder()
                .bookingId(booking.getId())
                .roomNumber(booking.getRoomNumber())
                .guestName(booking.getGuestName())
                .totalAmount(booking.getFinalPrice())
                .build();

        return invoiceRepository.save(invoice);
    }
}
