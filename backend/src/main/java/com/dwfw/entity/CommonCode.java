package com.dwfw.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class CommonCode {
    @JsonProperty("codeDivision")
    private String codeDivision;      // 코드구분
    
    @JsonProperty("code")
    private String code;              // 코드
    
    @JsonProperty("codeName")
    private String codeName;          // 코드명
    
    @JsonProperty("codeValueNum")
    private Integer codeValueNum;     // 코드값(숫자)
    
    @JsonProperty("codeValueStr")
    private String codeValueStr;      // 코드값(문자)
    
    @JsonProperty("sortOrder")
    private Integer sortOrder;        // 정렬순서
    
    @JsonProperty("useYn")
    private String useYn;             // 사용여부 (Y/N)
    
    @JsonProperty("remark")
    private String remark;            // 비고
    
    @JsonProperty("regDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime regDate;    // 등록일시
    
    @JsonProperty("modDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime modDate;    // 수정일시
    
    @JsonProperty("regUser")
    private String regUser;           // 등록자
    
    @JsonProperty("modUser")
    private String modUser;           // 수정자

    // 기본 생성자
    public CommonCode() {}

    // 생성자
    public CommonCode(String codeDivision, String code, String codeName) {
        this.codeDivision = codeDivision;
        this.code = code;
        this.codeName = codeName;
        this.useYn = "Y";
        this.sortOrder = 0;
    }

    // Getters and Setters
    public String getCodeDivision() {
        return codeDivision;
    }

    public void setCodeDivision(String codeDivision) {
        this.codeDivision = codeDivision;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCodeName() {
        return codeName;
    }

    public void setCodeName(String codeName) {
        this.codeName = codeName;
    }

    public Integer getCodeValueNum() {
        return codeValueNum;
    }

    public void setCodeValueNum(Integer codeValueNum) {
        this.codeValueNum = codeValueNum;
    }

    public String getCodeValueStr() {
        return codeValueStr;
    }

    public void setCodeValueStr(String codeValueStr) {
        this.codeValueStr = codeValueStr;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getUseYn() {
        return useYn;
    }

    public void setUseYn(String useYn) {
        this.useYn = useYn;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public LocalDateTime getRegDate() {
        return regDate;
    }

    public void setRegDate(LocalDateTime regDate) {
        this.regDate = regDate;
    }

    public LocalDateTime getModDate() {
        return modDate;
    }

    public void setModDate(LocalDateTime modDate) {
        this.modDate = modDate;
    }

    public String getRegUser() {
        return regUser;
    }

    public void setRegUser(String regUser) {
        this.regUser = regUser;
    }

    public String getModUser() {
        return modUser;
    }

    public void setModUser(String modUser) {
        this.modUser = modUser;
    }

    @Override
    public String toString() {
        return "CommonCode{" +
                "codeDivision='" + codeDivision + '\'' +
                ", code='" + code + '\'' +
                ", codeName='" + codeName + '\'' +
                ", useYn='" + useYn + '\'' +
                ", sortOrder=" + sortOrder +
                '}';
    }
}

