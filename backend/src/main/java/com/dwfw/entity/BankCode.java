package com.dwfw.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BankCode {
    @JsonProperty("bankCode")
    private String bankCode;           // 은행코드

    @JsonProperty("bankName")
    private String bankName;           // 은행명

    @JsonProperty("effectiveDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveDate;   // 적용일자 (yyyy-MM-dd)

    @JsonProperty("remitFee")
    private Integer remitFee;          // 송금수수료 (기본 0)

    @JsonProperty("sortOrder")
    private Integer sortOrder;         // 정렬순서

    @JsonProperty("useYn")
    private String useYn;              // 사용여부 (Y/N)

    @JsonProperty("remark")
    private String remark;             // 비고

    @JsonProperty("regDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime regDate;     // 등록일시

    @JsonProperty("modDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime modDate;     // 수정일시

    @JsonProperty("regUser")
    private String regUser;            // 등록자

    @JsonProperty("modUser")
    private String modUser;            // 수정자

    public BankCode() {}

    public BankCode(String bankCode, String bankName) {
        this.bankCode = bankCode;
        this.bankName = bankName;
        this.effectiveDate = LocalDate.parse("2000-01-01");
        this.remitFee = 0;
        this.sortOrder = 0;
        this.useYn = "Y";
        this.regDate = LocalDateTime.now();
        this.modDate = LocalDateTime.now();
        this.regUser = "SYSTEM";
        this.modUser = "SYSTEM";
    }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public Integer getRemitFee() { return remitFee; }
    public void setRemitFee(Integer remitFee) { this.remitFee = remitFee; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getUseYn() { return useYn; }
    public void setUseYn(String useYn) { this.useYn = useYn; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public LocalDateTime getRegDate() { return regDate; }
    public void setRegDate(LocalDateTime regDate) { this.regDate = regDate; }

    public LocalDateTime getModDate() { return modDate; }
    public void setModDate(LocalDateTime modDate) { this.modDate = modDate; }

    public String getRegUser() { return regUser; }
    public void setRegUser(String regUser) { this.regUser = regUser; }

    public String getModUser() { return modUser; }
    public void setModUser(String modUser) { this.modUser = modUser; }
}





