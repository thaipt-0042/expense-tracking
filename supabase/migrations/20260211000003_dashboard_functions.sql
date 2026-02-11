CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_income NUMERIC(12,2),
  total_expenses NUMERIC(12,2),
  net_balance NUMERIC(12,2),
  category_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_income NUMERIC(12,2);
  v_total_expenses NUMERIC(12,2);
  v_net_balance NUMERIC(12,2);
  v_category_breakdown JSONB;
BEGIN
  -- Calculate totals
  SELECT
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)
  INTO v_total_income, v_total_expenses
  FROM public.transactions t
  WHERE t.user_id = auth.uid()
    AND t.date >= p_start_date
    AND t.date < p_end_date;

  -- Calculate net balance
  v_net_balance := v_total_income - v_total_expenses;

  -- Get category breakdown (expenses only)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'category_id', COALESCE(grouped.category_id::TEXT, 'uncategorized'),
        'category_name', COALESCE(c.name, 'Uncategorized'),
        'category_color', COALESCE(c.color, '#6B7280'),
        'category_icon', c.icon_id,
        'total_amount', grouped.category_total,
        'transaction_count', grouped.transaction_count
      )
      ORDER BY grouped.category_total DESC
    ),
    '[]'::jsonb
  )
  INTO v_category_breakdown
  FROM (
    SELECT
      t.category_id,
      SUM(t.amount) as category_total,
      COUNT(*) as transaction_count
    FROM public.transactions t
    WHERE t.user_id = auth.uid()
      AND t.type = 'expense'
      AND t.date >= p_start_date
      AND t.date < p_end_date
    GROUP BY t.category_id
  ) grouped
  LEFT JOIN public.categories c ON grouped.category_id = c.id;

  -- Return single row
  RETURN QUERY SELECT v_total_income, v_total_expenses, v_net_balance, v_category_breakdown;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats TO authenticated;

COMMENT ON FUNCTION public.get_dashboard_stats IS 'Aggregate transaction statistics for dashboard with time period filtering';
