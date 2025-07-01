export interface StrategyFormState {
    asset: string;
    strategyType: string;
    intervalDays: string;
    intervalAmount: string;
    totalAmount: string;
    acceptedSlippage: string;
    action: string;
  }
  
  export interface FormErrors {
    [key: string]: string;
  }
  
  export interface Strategy {
    id: number;
    name: string;
    type: string;
    status: string;
    performance: string;
    allocation: string;
    createdDate: string;
    lastModified: string;
  }
  
  export interface CreateStep {
    title: string;
    icon: any;
  }
  
  export type ViewType = 'list' | 'create' | 'edit';