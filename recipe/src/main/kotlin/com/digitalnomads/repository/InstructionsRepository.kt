package com.digitalnomads.repository

import com.digitalnomads.entity.InstructionsEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface InstructionsRepository : JpaRepository<InstructionsEntity, Int> {
}