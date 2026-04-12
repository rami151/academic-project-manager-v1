package com.academic.backend.shared.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "task_labels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskLabel {

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskLabelId implements Serializable {
        private UUID taskId;
        private UUID labelId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TaskLabelId that = (TaskLabelId) o;
            return Objects.equals(taskId, that.taskId) && Objects.equals(labelId, that.labelId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(taskId, labelId);
        }
    }

    @EmbeddedId
    private TaskLabelId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("taskId")
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("labelId")
    @JoinColumn(name = "label_id", nullable = false)
    private Label label;
}
