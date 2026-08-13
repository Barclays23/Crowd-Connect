// // backend/src/services/profanity-services/implementations/TensorFlowFilterService.ts
// import * as toxicity from '@tensorflow-models/toxicity';
// import { IProfanityFilterService } from "../interfaces/IProfanityFilterService";


// // currently not installed or using (if need install it)
// npm install @tensorflow/tfjs-node @tensorflow-models/toxicity


// interface ToxicityPrediction {
//     label: string;
//     results: Array<{
//         probabilities: Float32Array | number[];
//         match: boolean | null;
//     }>;
// }


// export class TensorFlowFilterService implements IProfanityFilterService {
//     private model: toxicity.ToxicityClassifier | null = null;
//     private threshold = 0.85; // 85% confidence required to flag

    
//     constructor() {
//         // Load the model asynchronously when the server starts
//         toxicity.load(this.threshold, ['profanity', 'severe_toxicity']).then(model => {
//             this.model = model;
//             console.log("✅ TensorFlow Toxicity Model Loaded");
//         });
//     }

//     async isProfane(text: string): Promise<boolean> {
//         // If the model hasn't finished loading yet, allow the review to pass
//         if (!this.model) return false;

//         try {
//             const predictions = await this.model.classify([text]);
            
//             // Check if any category (profanity or severe_toxicity) returned true
//             const isToxic = predictions.some(p => p.results[0].match === true);
            
//             if (isToxic) {
//                 console.log(`\n⚠️ LOCAL ML FILTER CAUGHT: "${text}"\n`);
//             }

//             return isToxic;
            
//         } catch (error) {
//             console.error("TensorFlow Filter Error:", error);
//             return false;
//         }
//     }
// }