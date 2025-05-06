package com.digitalnomads.repository

import com.digitalnomads.entity.IngredientsEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IngredientsRepository : JpaRepository<IngredientsEntity, Int> {
}