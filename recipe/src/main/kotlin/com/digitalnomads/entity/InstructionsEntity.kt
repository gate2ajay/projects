package com.digitalnomads.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import java.util.*

@Entity
@Table(name ="instructions")
data class InstructionsEntity (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var instructionsId: Int? = null,
    @ManyToOne
    @JoinColumn(name = "recipeId")
    @JsonIgnore
    var recipeKey: RecipeEntity? = null,
    @CreationTimestamp
    @JsonIgnore
    var createdAt: Date? = null,
    var instructionDetails: String? = null
)