package com.dwfw.controller;

import com.dwfw.entity.BankCode;
import com.dwfw.service.BankCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/bank-codes", "/api/bank-codes"})
@CrossOrigin(origins = "*")
public class BankCodeController {

    @Autowired
    private BankCodeService bankCodeService;

    @GetMapping
    public ResponseEntity<List<BankCode>> getAll() {
        return ResponseEntity.ok(bankCodeService.getAllSorted());
    }

    @GetMapping("/search")
    public ResponseEntity<List<BankCode>> search(@RequestParam(value = "q", required = false) String q) {
        return ResponseEntity.ok(bankCodeService.searchByKeyword(q));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> save(@RequestBody List<BankCode> banks) {
        bankCodeService.save(banks);
        return ResponseEntity.ok(Map.of("message", "저장되었습니다."));
     }

    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> add(@RequestBody BankCode bank) {
        bankCodeService.add(bank);
        return ResponseEntity.ok(Map.of("message", "추가되었습니다."));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> delete(@RequestBody List<String> bankCodes) {
        bankCodeService.deleteByCodes(bankCodes);
        return ResponseEntity.ok(Map.of("message", "삭제되었습니다."));
    }
}



