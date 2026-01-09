import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get the API path from the request
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';

    // Route handlers based on path and method
    switch (`${req.method}:${apiPath}`) {
      case 'GET:health':
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      
      case 'GET:profile':
        const address = req.query.address as string;
        return res.status(200).json({ 
          success: true, 
          data: { address, message: 'User profile endpoint' } 
        });
      
      case 'GET:market/prices':
        return res.status(200).json({ 
          success: true, 
          data: { message: 'Market prices endpoint' } 
        });
      
      case 'POST:trade/preview':
        return res.status(200).json({ 
          success: true, 
          data: { message: 'Trade preview endpoint' } 
        });
      
      case 'GET:portfolio':
        return res.status(200).json({ 
          success: true, 
          data: { message: 'Portfolio endpoint' } 
        });
      
      case 'GET:liquidity/pools':
        return res.status(200).json({ 
          success: true, 
          data: { message: 'Liquidity pools endpoint' } 
        });
      
      case 'GET:analytics/tvl':
        return res.status(200).json({ 
          success: true, 
          data: { message: 'Analytics TVL endpoint' } 
        });
      
      case 'GET:assets':
        return res.status(200).json({ 
          success: true, 
          data: { message: 'Assets endpoint' } 
        });
      
      default:
        return res.status(404).json({ 
          success: false, 
          error: `Route not found: ${req.method} /api/${apiPath}` 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}