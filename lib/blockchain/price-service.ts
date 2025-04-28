/**
 * Service for fetching cryptocurrency prices using free APIs with fallbacks
 */
export interface PriceData {
  price: number;
  change24h?: number;
  timestamp: Date;
  isEstimate?: boolean;
  source?: string;
}

export interface ConversionRates {
  ETH_USD: number;
  USD_INR: number;
}

/**
 * Fetch ETH price from multiple APIs with fallbacks
 */
export const fetchEthPrice = async (): Promise<PriceData> => {
  const apiSources = [
    {
      name: "CoinGecko",
      url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
      parse: (data: any) => ({
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change || 0,
      }),
    },
    {
      name: "Binance",
      url: "https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT",
      parse: (data: any) => ({
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
      }),
    },
    {
      name: "CryptoCompare",
      url: "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
      parse: (data: any) => ({
        price: data.USD,
        change24h: 0,
      }),
    },
  ];
  for (const api of apiSources) {
    try {
      const response = await fetch(api.url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${api.name} API Error: ${response.status}`);
      }

      const data = await response.json();
      const parsedData = api.parse(data);

      return {
        price: parsedData.price,
        change24h: parsedData.change24h,
        timestamp: new Date(),
        source: api.name,
      };
    } catch (error) {
      console.warn(`${api.name} API failed:`, error);
    }
  }
  try {
    const response = await fetch("/api/blockchain/eth-price", {
      cache: "no-store",
    });
    const data = await response.json();

    return {
      price: data.price,
      change24h: data.change24h || 0,
      timestamp: new Date(data.timestamp),
      isEstimate: data.isEstimate,
      source: "Server API",
    };
  } catch (backupError) {
    console.error("All price APIs failed:", backupError);
    return {
      price: 3150.42,
      timestamp: new Date(),
      isEstimate: true,
      source: "Fallback Value",
    };
  }
};

/**
 * Get USD to INR conversion rate from free APIs
 */
export const getUsdToInrRate = async (): Promise<number> => {
  const apiSources = [
    {
      name: "ExchangeRate-API",
      url: "https://open.er-api.com/v6/latest/USD",
      parse: (data: any) => data.rates?.INR,
    },
    {
      name: "Fixer.io",
      url: "https://api.exchangerate.host/latest?base=USD&symbols=INR",
      parse: (data: any) => data.rates?.INR,
    },
  ];
  for (const api of apiSources) {
    try {
      const response = await fetch(api.url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${api.name} API Error: ${response.status}`);
      }

      const data = await response.json();
      const rate = api.parse(data);

      if (rate && typeof rate === "number" && !isNaN(rate)) {
        return rate;
      } else {
        throw new Error(`Invalid rate data from ${api.name}`);
      }
    } catch (error) {
      console.warn(`${api.name} API failed:`, error);
    }
  }
  return 83.12;
};

/**
 * Get currency conversion rates using free external APIs
 */
export const getConversionRates = async (): Promise<ConversionRates> => {
  try {
    const [ethData, usdInrRate] = await Promise.all([
      fetchEthPrice(),
      getUsdToInrRate(),
    ]);

    return {
      ETH_USD: ethData.price,
      USD_INR: usdInrRate,
    };
  } catch (error) {
    console.error("Error getting conversion rates:", error);
    return {
      ETH_USD: 3150.42,
      USD_INR: 83.12,
    };
  }
};

/**
 * Convert between currencies
 */
export const convertCurrency = async (
  amount: number,
  from: "ETH" | "USD" | "INR",
  to: "ETH" | "USD" | "INR"
): Promise<number> => {
  if (from === to) return amount;

  const rates = await getConversionRates();
  let amountInUsd = amount;
  if (from === "ETH") {
    amountInUsd = amount * rates.ETH_USD;
  } else if (from === "INR") {
    amountInUsd = amount / rates.USD_INR;
  }
  if (to === "ETH") {
    return amountInUsd / rates.ETH_USD;
  } else if (to === "INR") {
    return amountInUsd * rates.USD_INR;
  } else {
    return amountInUsd;
  }
};
