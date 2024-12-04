import React from 'react';
import { useParams, NavLink } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from '../use-current-match';
import { buildMatchRoundPath, buildMatchRoundsPath } from 'csdm/ui/routes-paths';

type LinkProps = {
  children: React.ReactNode;
  to: string;
  end?: boolean;
};

function Link({ children, to, end }: LinkProps) {
  return (
    <NavLink
      className={({ isActive }) => {
        return `flex flex-col items-center justify-center h-[50px] cursor-pointer border-r border-r-gray-300 ${
          isActive ? 'bg-gray-200 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'
        }`;
      }}
      to={to}
      end={end}
      viewTransition={true}
    >
      <div className="min-w-40 flex justify-center items-center px-8">{children}</div>
    </NavLink>
  );
}

export function RoundsNavigationBar() {
  const match = useCurrentMatch();
  const { number, checksum } = useParams<'number' | 'checksum'>();
  if (typeof checksum !== 'string') {
    throw new Error('Missing checksum parameter in url');
  }
  const { rounds } = match;
  let previousRoundUrl: string;
  let nextRoundUrl: string;
  if (number) {
    const currentRoundNumber = Number(number);
    previousRoundUrl = buildMatchRoundPath(checksum, Math.max(1, currentRoundNumber - 1));
    nextRoundUrl = buildMatchRoundPath(checksum, Math.min(currentRoundNumber + 1, rounds.length));
  } else {
    previousRoundUrl = buildMatchRoundsPath(checksum);
    nextRoundUrl = buildMatchRoundPath(checksum, 1);
  }

  return (
    <div className="flex mt-auto h-[50px] border-t border-t-gray-300">
      <Link to={buildMatchRoundsPath(checksum)} end={true}>
        <p>
          <Trans>Overview</Trans>
        </p>
      </Link>
      <Link to={previousRoundUrl}>
        <p className="text-body-strong">{`<`}</p>
      </Link>
      <div className="flex overflow-x-auto overflow-y-hidden">
        {rounds.map((round) => {
          return (
            <Link key={`round-${round.number}`} to={buildMatchRoundPath(checksum, round.number)} end={true}>
              {round.number}
            </Link>
          );
        })}
      </div>
      <Link to={nextRoundUrl}>
        <p className="text-body-strong">{`>`}</p>
      </Link>
    </div>
  );
}
