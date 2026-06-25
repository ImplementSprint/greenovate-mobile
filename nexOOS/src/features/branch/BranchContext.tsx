import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { branchStorage } from '@/utils/storage';

import { getBranches } from './branchApi';
import { type Branch } from './branchData';

type BranchContextValue = {
  branches: Branch[];
  selectedBranch: Branch | null;
  selectBranch: (branch: Branch) => Promise<void>;
};

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({ children }: PropsWithChildren) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([getBranches(), branchStorage.get()])
      .then(([fetchedBranches, savedBranchId]) => {
        if (!active) {
          return;
        }

        setBranches(fetchedBranches);

        if (!savedBranchId) {
          return;
        }

        const matchingBranch =
          fetchedBranches.find((branch) => String(branch.id) === savedBranchId) ?? null;
        setSelectedBranch(matchingBranch);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setBranches([]);
        setSelectedBranch(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<BranchContextValue>(
    () => ({
      branches,
      selectedBranch,
      selectBranch: async (branch) => {
        setSelectedBranch(branch);
        await branchStorage.set(String(branch.id));
      },
    }),
    [branches, selectedBranch],
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export const useBranch = () => {
  const context = useContext(BranchContext);

  if (!context) {
    throw new Error('useBranch must be used within BranchProvider.');
  }

  return context;
};
