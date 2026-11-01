#pragma once

inline float ClampToRange(float value, float minimum, float maximum) {
    if (maximum < minimum) {
        return minimum;
    }

    return value < minimum ? minimum : (value > maximum ? maximum : value);
}
