# Setting Up TradingView Alerts with Webhook Integration

This guide will help you configure TradingView alerts to automatically execute cryptocurrency trades through our Coinbase webhook integration.

## Step 1: Import the Strategy into TradingView

1. Log in to your TradingView account.
2. Go to "Chart" and select your desired cryptocurrency pair (e.g., BTCUSD).
3. Click on "Pine Editor" at the bottom of the screen.
4. Delete any existing code and paste the entire content of the `tradingview_strategy.pine` script.
5. Click "Save" and give your script a name like "Crypto Strategy with ADX".
6. Click "Add to Chart" to apply the strategy to your chart.

## Step 2: Configure the Strategy Parameters

Once the strategy is loaded onto your chart, you can customize it:

1. Click on the settings icon (gear) next to the strategy name on your chart.
2. Adjust parameters according to your risk tolerance and market conditions:
   - **ADX Filter**: Helps avoid choppy markets (recommended value: 20-25)
   - **Volume Filter**: Confirms trend strength with volume
   - **Take Profit/Stop Loss Percentages**: Set these based on your risk tolerance
   - **EMA Lengths**: Adjust these for different timeframes
   - **RSI Parameters**: Fine-tune overbought/oversold levels

## Step 3: Backtest the Strategy

1. Select a date range using the "From Date" and "To Date" inputs.
2. Review the performance metrics displayed in the top-right corner of your chart.
3. Adjust parameters to optimize for your target cryptocurrency pairs.
4. Test on different timeframes (1h, 4h, daily) to find the best settings.

## Step 4: Set Up TradingView Alerts

1. Click on the "Alerts" button in the right sidebar.
2. Click "Create Alert".
3. Configure your alert:
   - **Condition**: Strategy enters long position / Strategy exits long position
   - **Options**: Alert on first occurrence only
   - **Alert Actions**: Enable "Webhook URL"
   - **Webhook URL**: Enter your webhook endpoint (default is `https://yourserver.com/api/webhook`)
   - **Alert message**: Use the template format: `{"action": "{{strategy.order.action}}", "symbol": "{{ticker}}", "amount": 0.01}`

## Step 5: Configure Your Webhook Server

1. Log in to your Coinbase Webhook Bot Dashboard.
2. Navigate to the "Bot Configuration" tab.
3. Set your preferred trading pair (e.g., BTC-USD).
4. Set your default order size (e.g., 0.01 BTC).
5. Uncheck "Test Mode" when you're ready to execute real trades.

## Step 6: Test the Integration

1. Keep "Test Mode" enabled initially to verify that alerts are being properly received.
2. Monitor the "Activity Log" tab to confirm that webhook requests are being received.
3. Troubleshoot any connection issues before enabling real trading.

## Strategy Explanation

This trading strategy combines several technical indicators to identify high-probability trade setups:

1. **ADX Filter**: Helps avoid ranging/choppy markets that can lead to false signals.
2. **Volume Confirmation**: Ensures that market movements are backed by sufficient volume.
3. **EMA Crossovers**: Primary entry signal using multiple moving averages to confirm trend direction.
4. **RSI Conditions**: Additional filter to avoid buying overbought markets or selling oversold markets.
5. **Dynamic Stop Loss**: Trailing stop loss adjusts as price moves favorably.

### Trading Logic:

**BUY Signals** occur when:
- Fast EMA crosses above Slow EMA
- Price is above Super Slow EMA (confirming uptrend)
- ADX is above threshold (strong trend)
- Volume is above average (confirming move)
- RSI is below oversold level (avoiding buying at the top)

**SELL Signals** occur when:
- Fast EMA crosses below Slow EMA
- Price is below Super Slow EMA (confirming downtrend)
- ADX is above threshold (strong trend)
- Volume is above average (confirming move)
- RSI is above overbought level (avoiding selling at the bottom)

**Exit Conditions**:
- Moving average crossover in the opposite direction
- Trailing stop loss is hit
- Fixed take profit target is reached
- Fixed stop loss is hit

## Important Notes

- Always start with smaller position sizes until you're comfortable with the strategy.
- The strategy's success rate varies across different market conditions.
- Back-testing results don't guarantee future performance.
- Consider tax implications of frequent trading.
- Monitor your positions regularly even with automation in place.

## Supported Trading Pairs

This strategy works with all cryptocurrency pairs available on Coinbase, including:
- BTC-USD (Bitcoin)
- ETH-USD (Ethereum)
- SOL-USD (Solana)
- DOGE-USD (Dogecoin)
- And many others...

For best results, start with the most liquid pairs like BTC-USD and ETH-USD.