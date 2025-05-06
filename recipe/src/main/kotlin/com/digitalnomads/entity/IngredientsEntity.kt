package com.digitalnomads.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime


@Entity
@Table(name = "ingredients")
data class IngredientsEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val ingredientsId: Int? = null,

    @ManyToOne  // Ensure this annotation is present
    @JoinColumn(name = "recipeId")  // Ensure this annotation is present with the correct foreign key column
    val recipe: RecipeEntity? = null,

    @CreationTimestamp
    val createdAt: LocalDateTime? = null,

    val ingredientsDetail: String? = null
)