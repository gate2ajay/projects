package com.digitalnomads.repository

import com.digitalnomads.entity.RecipeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RecipeRepository : JpaRepository<RecipeEntity, Int> {
}