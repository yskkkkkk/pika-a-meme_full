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
            throw MemeCreationPolicyViolationException("텍스트를 최소 1개 입력해야 합니다.")
        }
        if (canvasState.textItems.size > BASIC_MAX_TEXT_COUNT) {
            throw MemeCreationPolicyViolationException("BASIC 하트는 텍스트를 ${BASIC_MAX_TEXT_COUNT}개까지만 추가할 수 있습니다.")
        }
        if (canvasState.stickerItems.isNotEmpty()) {
            throw MemeCreationPolicyViolationException("BASIC 하트는 스티커를 사용할 수 없습니다.")
        }
        if (canvasState.textItems.any { it.fontFamily != CanvasState.DEFAULT_FONT }) {
            throw MemeCreationPolicyViolationException("BASIC 하트는 기본 폰트만 사용할 수 있습니다.")
        }
    }

    private fun validateSpecial(canvasState: CanvasState) {
        if (canvasState.textItems.isEmpty()) {
            throw MemeCreationPolicyViolationException("텍스트를 최소 1개 입력해야 합니다.")
        }
    }
}
