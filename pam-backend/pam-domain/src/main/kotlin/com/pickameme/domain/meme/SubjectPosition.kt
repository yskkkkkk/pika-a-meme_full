package com.pickameme.domain.meme

enum class SubjectPosition {
    TOP, BOTTOM, LEFT, RIGHT, CENTER,
    TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT,
    FULL_HORIZONTAL, FULL_VERTICAL, FULL;

    fun toBubblePosition(): BubblePosition = when (this) {
        TOP              -> BubblePosition.BOTTOM
        BOTTOM           -> BubblePosition.TOP
        LEFT             -> BubblePosition.RIGHT
        RIGHT            -> BubblePosition.LEFT
        TOP_LEFT         -> BubblePosition.BOTTOM_RIGHT
        TOP_RIGHT        -> BubblePosition.BOTTOM_LEFT
        BOTTOM_LEFT      -> BubblePosition.TOP_RIGHT
        BOTTOM_RIGHT     -> BubblePosition.TOP_LEFT
        CENTER,
        FULL_HORIZONTAL  -> if (Math.random() < 0.5) BubblePosition.TOP else BubblePosition.BOTTOM
        FULL_VERTICAL    -> if (Math.random() < 0.5) BubblePosition.LEFT else BubblePosition.RIGHT
        FULL             -> BubblePosition.entries.filter {
            it in listOf(BubblePosition.TOP_LEFT, BubblePosition.TOP_RIGHT,
                         BubblePosition.BOTTOM_LEFT, BubblePosition.BOTTOM_RIGHT)
        }.random()
    }
}

enum class BubblePosition {
    TOP, BOTTOM, LEFT, RIGHT,
    TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT
}
