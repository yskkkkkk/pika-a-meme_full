package com.pickameme.domain.meme

import com.pickameme.domain.exception.MemeCreationPolicyViolationException

object MemeCreationPolicy {

    private const val BASIC_MAX_TEXT_COUNT = 1

    fun validate(canvasState: CanvasState, option: MemeCreationOption) {
        when (option) {
            MemeCreationOption.BASIC -> validateBasic(canvasState)
            MemeCreationOption.SPECIAL -> validateSpecial(canvasState)
        }
    }

    private fun validateBasic(canvasState: CanvasState) {
        if (canvasState.textItems.isEmpty()) {
            throw MemeCreationPolicyViolationException("At least one text item is required.")
        }
        if (canvasState.textItems.size > BASIC_MAX_TEXT_COUNT) {
            throw MemeCreationPolicyViolationException("BASIC heart allows up to ${BASIC_MAX_TEXT_COUNT} text item(s).")
        }
        if (canvasState.stickerItems.isNotEmpty()) {
            throw MemeCreationPolicyViolationException("BASIC heart cannot use stickers.")
        }
        if (canvasState.textItems.any { it.fontFamily != CanvasState.DEFAULT_FONT }) {
            throw MemeCreationPolicyViolationException("BASIC heart can only use the default font.")
        }
    }

    private fun validateSpecial(canvasState: CanvasState) {
        if (canvasState.textItems.isEmpty()) {
            throw MemeCreationPolicyViolationException("At least one text item is required.")
        }
    }
}
