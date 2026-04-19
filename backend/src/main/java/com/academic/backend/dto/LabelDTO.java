package com.academic.backend.dto;

import com.academic.backend.shared.entity.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabelDTO {
    private UUID id;
    private String name;
    private String color;

    public LabelDTO(Label label) {
        this.id = label.getId();
        this.name = label.getName();
        this.color = label.getColor();
    }
}
