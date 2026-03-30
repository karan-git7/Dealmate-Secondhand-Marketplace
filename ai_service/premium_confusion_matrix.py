import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

def generate_premium_cm():
    # Use the precise numbers from the report for perfect consistency
    # TN, FP, FN, TP
    cm = np.array([[180840, 19160], 
                  [18320, 181680]])
    
    # Calculate percentages
    cm_perc = cm.astype('float') / cm.sum() * 100
    
    # Labels for the matrix cells
    labels = np.array([
        [f"{cm[0,0]:,}\n({cm_perc[0,0]:.1f}%)", f"{cm[0,1]:,}\n({cm_perc[0,1]:.1f}%)"],
        [f"{cm[1,0]:,}\n({cm_perc[1,0]:.1f}%)", f"{cm[1,1]:,}\n({cm_perc[1,1]:.1f}%)"]
    ])

    # Styling
    plt.figure(figsize=(10, 8), dpi=300)
    sns.set_theme(style="whitegrid")
    
    # Using the preferred 'Blues' color palette
    ax = sns.heatmap(cm, annot=labels, fmt="", cmap="Blues", 
                    cbar=True, square=True, 
                    linewidths=2, linecolor='white',
                    annot_kws={"size": 16, "weight": "bold", "color": "black"})

    # Customizing axes and labels
    plt.title('DEALMATE AI\nSentiment Analysis Confusion Matrix', fontsize=20, fontweight='bold', pad=30)
    plt.xlabel('PREDICTED SENTIMENT', fontsize=14, fontweight='bold', labelpad=15)
    plt.ylabel('ACTUAL SENTIMENT', fontsize=14, fontweight='bold', labelpad=15)
    
    ax.set_xticklabels(['NEGATIVE', 'POSITIVE'], fontsize=12, fontweight='bold')
    ax.set_yticklabels(['NEGATIVE', 'POSITIVE'], fontsize=12, fontweight='bold')

    # Adding a subtle border
    plt.tight_layout()
    
    # Save as premium version
    save_path = os.path.join(os.path.dirname(__file__), "premium_confusion_matrix.png")
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Premium Confusion Matrix saved to: {save_path}")

if __name__ == "__main__":
    generate_premium_cm()
