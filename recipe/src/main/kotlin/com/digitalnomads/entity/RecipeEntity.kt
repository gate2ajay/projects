package com.digitalnomads.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import java.util.*

@Entity
@Table(name ="recipe")
data class RecipeEntity (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var recipeId: Int? = null,
    var recipeName: String? = null,
    var recipeInstructions: String? = null,
    var recipeImage: String? = null,
    @CreationTimestamp
    var createdAt: Date? = null,
    @OneToMany(mappedBy = "recipe")
    var ingredientsEntity: List<IngredientsEntity>? = null,
    @OneToMany(mappedBy = "recipeKey")
    var instructionsEntity: List<InstructionsEntity>? = null
)