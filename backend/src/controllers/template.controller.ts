import { Request, Response } from 'express';
export const getTemplates = async (req: Request, res: Response) => {
  console.log('Template_Controller: getTemplates');
  res.status(501).json({ message: 'Not Implemented' });
};
export const getTemplateById = async (req: Request, res: Response) => {
  console.log('Template_Controller: getTemplateById');
  res.status(501).json({ message: 'Not Implemented' });
};
// Subscription related endpoints from spec are likely better in their own controller,
// but spec lists them under "Templates" section for API endpoints.
// For now, let's follow the spec's grouping for stubs.
export const createCheckoutSession = async (req: Request, res: Response) => {
   console.log('Template_Controller_OR_Subscription_Controller: createCheckoutSession');
   res.status(501).json({ message: 'Not Implemented' });
};
export const getSubscriptionStatus = async (req: Request, res: Response) => {
   console.log('Template_Controller_OR_Subscription_Controller: getSubscriptionStatus');
   res.status(501).json({ message: 'Not Implemented' });
};
 export const stripeWebhook = async (req: Request, res: Response) => {
   console.log('Template_Controller_OR_Subscription_Controller: stripeWebhook');
   res.status(501).json({ message: 'Not Implemented' });
};
