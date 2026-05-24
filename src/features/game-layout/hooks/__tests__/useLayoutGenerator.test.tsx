import {getLayoutContainerSize} from '../useLayoutGenerator';

describe('getLayoutContainerSize', () => {
  it('uses full Android bounds taking the largest window/screen values', () => {
    expect(
      getLayoutContainerSize({
        width: 360,
        height: 780,
      },
      {
        width: 360,
        height: 800,
      },
      'android',
      ),
    ).toEqual({
      containerWidth: 360,
      containerHeight: 800,
    });
  });

  it('keeps window dimensions on iOS', () => {
    expect(
      getLayoutContainerSize(
        {
          width: 390,
          height: 844,
        },
        {
          width: 390,
          height: 852,
        },
        'ios',
      ),
    ).toEqual({
      containerWidth: 390,
      containerHeight: 844,
    });
  });
});