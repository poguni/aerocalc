from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import scipy.stats as stats
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_plot_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches='tight', transparent=True)
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return img_str

def get_witty_message(p_value=None, r_value=None):
    if p_value is not None:
        if p_value < 0.05:
            return "오, 통계적으로 유의미하네요! 우연이 아니라는 뜻입니다. (아마도요)"
        else:
            return "이 데이터들은 서로 별로 관심이 없는 것 같군요. (p > 0.05)"
    if r_value is not None:
        if abs(r_value) > 0.8:
            return "둘의 관계가 거의 껌딱지 수준입니다! 엄청난 양의 상관관계네요."
    return "숫자들은 거짓말을 하지 않죠. 그저 복잡하게 말할 뿐입니다."

@app.post("/api/stats/univariate")
async def univariate_stats(
    data_input: str = Form(None),
    file: UploadFile = File(None)
):
    try:
        # Load data
        if file and file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
            data = pd.to_numeric(df.iloc[:, 0], errors='coerce').dropna()
        elif data_input:
            data_list = data_input.replace(',', ' ').split()
            data = pd.Series(pd.to_numeric(data_list, errors='coerce')).dropna()
        else:
            return {"error": "데이터가 제공되지 않았습니다."}
            
        if len(data) < 2:
            return {"error": "분석을 위해 최소 2개 이상의 숫자가 필요합니다."}

        mean = data.mean()
        median = data.median()
        std = data.std()
        var = data.var()
        sem = stats.sem(data)
        
        # Plot
        sns.set_theme(style="darkgrid", rc={"axes.facecolor": "rgba(0,0,0,0)", "figure.facecolor":"rgba(0,0,0,0)"})
        fig, ax = plt.subplots(figsize=(6, 4))
        sns.histplot(data, kde=True, ax=ax, color="#3b82f6")
        ax.set_title("Data Distribution", color="white")
        ax.tick_params(colors="white")
        ax.xaxis.label.set_color("white")
        ax.yaxis.label.set_color("white")
        plot_base64 = create_plot_base64(fig)
        
        return {
            "stats": {
                "mean": round(mean, 4),
                "median": round(median, 4),
                "std": round(std, 4),
                "var": round(var, 4),
                "sem": round(sem, 4)
            },
            "plot": plot_base64,
            "message": get_witty_message()
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/stats/bivariate")
async def bivariate_stats(
    group_a: str = Form(...),
    group_b: str = Form(...)
):
    try:
        a_list = group_a.replace(',', ' ').split()
        b_list = group_b.replace(',', ' ').split()
        
        data_a = pd.Series(pd.to_numeric(a_list, errors='coerce')).dropna()
        data_b = pd.Series(pd.to_numeric(b_list, errors='coerce')).dropna()
        
        min_len = min(len(data_a), len(data_b))
        if min_len < 2:
            return {"error": "분석을 위해 최소 2개 이상의 쌍이 필요합니다."}
            
        data_a = data_a[:min_len]
        data_b = data_b[:min_len]
        
        r_val, p_val_r = stats.pearsonr(data_a, data_b)
        t_val, p_val_t = stats.ttest_ind(data_a, data_b)
        
        # Plot
        sns.set_theme(style="darkgrid", rc={"axes.facecolor": "rgba(0,0,0,0)", "figure.facecolor":"rgba(0,0,0,0)"})
        fig, ax = plt.subplots(figsize=(6, 4))
        sns.regplot(x=data_a, y=data_b, ax=ax, scatter_kws={'color': '#3b82f6'}, line_kws={'color': '#ef4444'})
        ax.set_title("Scatter Plot (Group A vs Group B)", color="white")
        ax.set_xlabel("Group A", color="white")
        ax.set_ylabel("Group B", color="white")
        ax.tick_params(colors="white")
        plot_base64 = create_plot_base64(fig)
        
        # Determine message based on p-value or r-value
        if p_val_t > 0.05:
            msg = get_witty_message(p_value=p_val_t)
        elif abs(r_val) > 0.8:
            msg = get_witty_message(r_value=r_val)
        else:
            msg = get_witty_message(p_value=p_val_t)
            
        return {
            "stats": {
                "pearson_r": round(r_val, 4),
                "r_p_value": round(p_val_r, 4),
                "t_value": round(t_val, 4),
                "t_p_value": round(p_val_t, 4)
            },
            "plot": plot_base64,
            "message": msg
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
