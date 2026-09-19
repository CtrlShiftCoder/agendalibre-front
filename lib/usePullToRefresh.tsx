import React, { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { refreshAgendaData } from '@/lib/pullRefresh';
import { useColors } from '@/store/useTheme';

/** Shared RefreshControl wiring for Hoy / clientes / servicios. */
export function usePullToRefresh() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAgendaData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        void onRefresh();
      }}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.surfaceContainerLowest}
    />
  );

  return { refreshing, onRefresh, refreshControl };
}
