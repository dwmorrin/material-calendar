import React, { FunctionComponent } from "react";
import { makeStyles, Button } from "@material-ui/core";

const useStyles = makeStyles({
  selected: {
    color: "red",
  },
});

enum PageEllipsis {
  None,
  Left,
  Right,
  Both,
}

/**
 * helper function for the parent component
 */
export const getTotalPages = (total: number, recordsPerPage: number): number =>
  Math.ceil(total / recordsPerPage);

const range = (length: number): undefined[] => Array.from({ length });

const getMiddlePage = ({
  page = 0,
  ellipsis = 0,
  index = 0,
  middleLength = 0,
  pages = 0,
  settings = {
    buttons: { max: 7, min: 4, left: 2, right: 2 },
    middleLength: 3,
  },
}): number => {
  if (ellipsis === PageEllipsis.Right || ellipsis === PageEllipsis.None) {
    return index + settings.buttons.left;
  }
  if (ellipsis === PageEllipsis.Left) {
    return pages - settings.buttons.right - middleLength + index;
  }
  /**
   * C := "current" page; the one that is currently being viewed
   * index:  | 0| 1| 2| 3| 4|-->
   * length 1| C|  |  |  |  |
   *   |    2| C|+1|  |  |  |
   *   v    3|-1| C|+1|  |  |
   *        4|-2|-1| C|+1|+2|
   */
  const currentIndex = Math.ceil(middleLength / 2) - 1;
  const offset = index - currentIndex;
  return page + offset;
};

const shortPageList = (
  total: number,
  settings = { buttons: { left: 2 }, middleLength: 3 }
): boolean => total - settings.buttons.left <= settings.middleLength;

const getMiddleLength = (
  total: number,
  settings = { buttons: { left: 2 }, middleLength: 3 }
): number => {
  if (total <= settings.buttons.left) return 0;
  if (shortPageList(total)) return total - 1 - settings.buttons.left;
  return settings.middleLength;
};

const getEllipsis = (
  total: number,
  current: number,
  settings = { buttons: { left: 2, max: 7 }, middleLength: 3 }
): PageEllipsis => {
  if (total <= settings.buttons.max) return PageEllipsis.None;
  if (current < settings.buttons.left + settings.middleLength)
    return PageEllipsis.Right;
  if (current >= total - 4) return PageEllipsis.Left;
  return PageEllipsis.Both;
};

const getSelected = (page: number, classes: Record<"selected", string>) => (
  x: number
): string => (x === page ? classes.selected : "");

interface PagerProps {
  page: number; // current page #
  pages: number; // total pages
  setPage: (page: number) => void; // for managing state
  settings?: {
    buttons: { left: number; right: number; max: number; min: number };
    middleLength: number;
  };
}

const Pager: FunctionComponent<PagerProps> = ({
  page,
  pages,
  setPage,
  settings = {
    buttons: { left: 2, right: 2, max: 7, min: 4 },
    middleLength: 3,
  },
}) => {
  const classes = useStyles();
  const selected = getSelected(page, classes);
  const ellipsis = getEllipsis(pages, page, settings);
  const middleLength = getMiddleLength(pages, settings);

  if (ellipsis === PageEllipsis.None) {
    return (
      <span>
        {range(pages).map((_, index) => (
          <Button
            className={selected(index)}
            key={`pagination-${index}`}
            onClick={(): void => setPage(index)}
          >
            {index + 1}
          </Button>
        ))}
      </span>
    );
  }

  return (
    <span>
      <Button className={selected(0)} onClick={(): void => setPage(0)}>
        1
      </Button>
      {ellipsis === PageEllipsis.Left || ellipsis === PageEllipsis.Both ? (
        <Button>...</Button>
      ) : (
        <Button className={selected(1)} onClick={(): void => setPage(1)}>
          2
        </Button>
      )}
      {range(middleLength).map((_, index) => (
        <Button
          className={selected(
            getMiddlePage({ middleLength, index, pages, page, ellipsis })
          )}
          key={`pagination-${index}`}
          onClick={(): void =>
            setPage(
              getMiddlePage({ middleLength, index, pages, page, ellipsis })
            )
          }
        >
          {getMiddlePage({ middleLength, index, pages, page, ellipsis }) + 1}
        </Button>
      ))}
      {ellipsis === PageEllipsis.Right || ellipsis === PageEllipsis.Both ? (
        <Button>...</Button>
      ) : (
        <Button
          className={selected(pages - 2)}
          onClick={(): void => setPage(pages - 2)}
        >
          {pages - 1}
        </Button>
      )}
      <Button
        className={selected(pages - 1)}
        onClick={(): void => setPage(pages - 1)}
      >
        {pages}
      </Button>
    </span>
  );
};

export default Pager;
