package com.dwfw.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class BaseCode {
    @JsonProperty("codeCategory")
    private String codeCategory;      // 코드분류
    
    @JsonProperty("code")
    private String code;             // 코드
    
    @JsonProperty("codeName")
    private String codeName;         // 코드명
    
    @JsonProperty("division1")
    private String division1;       // 구분1
    
    @JsonProperty("division2")
    private String division2;       // 구분2
    
    @JsonProperty("division3")
    private String division3;       // 구분3
    
    @JsonProperty("codeDescription")
    private String codeDescription;  // 코드설명
    
    @JsonProperty("sortOrder")
    private Integer sortOrder;      // 정렬순서
    
    @JsonProperty("useYn")
    private String useYn;           // 사용여부 (Y/N)
    
    @JsonProperty("remark")
    private String remark;           // 비고
    
    @JsonProperty("itemDefinition")
    private String itemDefinition;  // 항목정의
    
    @JsonProperty("discountRate1")
    private Double discountRate1;   // 할인율1
    
    @JsonProperty("discountRate2")
    private Double discountRate2;   // 할인율2
    
    @JsonProperty("discountRate3")
    private Double discountRate3;   // 할인율3
    
    @JsonProperty("amount1")
    private Double amount1;         // 금액1
    
    @JsonProperty("amount2")
    private Double amount2;         // 금액2
    
    @JsonProperty("amount3")
    private Double amount3;         // 금액3
    
    @JsonProperty("image1")
    private String image1;          // 이미지1
    
    @JsonProperty("image2")
    private String image2;          // 이미지2
    
    @JsonProperty("image3")
    private String image3;          // 이미지3
    
    @JsonProperty("regDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime regDate;  // 등록일시
    
    @JsonProperty("modDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime modDate;  // 수정일시
    
    @JsonProperty("regUser")
    private String regUser;         // 등록자
    
    @JsonProperty("modUser")
    private String modUser;         // 수정자

    // 기본 생성자
    public BaseCode() {}

    // 생성자
    public BaseCode(String codeCategory, String code, String codeName) {
        this.codeCategory = codeCategory;
        this.code = code;
        this.codeName = codeName;
        this.useYn = "Y";
        this.sortOrder = 0;
    }

    // Getters and Setters
    public String getCodeCategory() {
        return codeCategory;
    }

    public void setCodeCategory(String codeCategory) {
        this.codeCategory = codeCategory;
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

    public String getDivision1() {
        return division1;
    }

    public void setDivision1(String division1) {
        this.division1 = division1;
    }

    public String getDivision2() {
        return division2;
    }

    public void setDivision2(String division2) {
        this.division2 = division2;
    }

    public String getDivision3() {
        return division3;
    }

    public void setDivision3(String division3) {
        this.division3 = division3;
    }

    public String getCodeDescription() {
        return codeDescription;
    }

    public void setCodeDescription(String codeDescription) {
        this.codeDescription = codeDescription;
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

    public String getItemDefinition() {
        return itemDefinition;
    }

    public void setItemDefinition(String itemDefinition) {
        this.itemDefinition = itemDefinition;
    }

    public Double getDiscountRate1() {
        return discountRate1;
    }

    public void setDiscountRate1(Double discountRate1) {
        this.discountRate1 = discountRate1;
    }

    public Double getDiscountRate2() {
        return discountRate2;
    }

    public void setDiscountRate2(Double discountRate2) {
        this.discountRate2 = discountRate2;
    }

    public Double getDiscountRate3() {
        return discountRate3;
    }

    public void setDiscountRate3(Double discountRate3) {
        this.discountRate3 = discountRate3;
    }

    public Double getAmount1() {
        return amount1;
    }

    public void setAmount1(Double amount1) {
        this.amount1 = amount1;
    }

    public Double getAmount2() {
        return amount2;
    }

    public void setAmount2(Double amount2) {
        this.amount2 = amount2;
    }

    public Double getAmount3() {
        return amount3;
    }

    public void setAmount3(Double amount3) {
        this.amount3 = amount3;
    }

    public String getImage1() {
        return image1;
    }

    public void setImage1(String image1) {
        this.image1 = image1;
    }

    public String getImage2() {
        return image2;
    }

    public void setImage2(String image2) {
        this.image2 = image2;
    }

    public String getImage3() {
        return image3;
    }

    public void setImage3(String image3) {
        this.image3 = image3;
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
        return "BaseCode{" +
                "codeCategory='" + codeCategory + '\'' +
                ", code='" + code + '\'' +
                ", codeName='" + codeName + '\'' +
                ", useYn='" + useYn + '\'' +
                ", sortOrder=" + sortOrder +
                '}';
    }
}
