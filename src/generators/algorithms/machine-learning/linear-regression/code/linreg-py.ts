export const LINREG_PY =
` # Linear Regression via Gradient Descent
 # Minimizes MSE: L = (1/n) Σ(yᵢ - ŷᵢ)²

 [[reg.data]]def fit(X, Y, lr, epochs):[[/reg.data]]
     [[reg.init]]n = len(X)
     m, b = 0.0, 0.0[[/reg.init]]

     [[reg.epoch]]for epoch in range(epochs):[[/reg.epoch]]

       [[reg.predict]]y_hat = [0.0] * n
       for i in range(n):
           [[reg.predict.step]]y_hat[i] = m * X[i] + b[[/reg.predict.step]][[/reg.predict]]

       [[reg.loss]]loss = 0.0
       for i in range(n):
           [[reg.loss.step]]loss += (Y[i] - y_hat[i]) ** 2[[/reg.loss.step]]
       [[reg.loss.avg]]loss /= n[[/reg.loss.avg]][[/reg.loss]]

       [[reg.grad]]dm, db = 0.0, 0.0
       for i in range(n):
           [[reg.grad.step]]dm += X[i] * (Y[i] - y_hat[i])
           db += (Y[i] - y_hat[i])[[/reg.grad.step]]
       [[reg.grad.scale]]dm *= -2.0 / n
       db *= -2.0 / n[[/reg.grad.scale]][[/reg.grad]]

       [[reg.update]]m -= lr * dm
       b -= lr * db[[/reg.update]]

     [[reg.done]]return m, b[[/reg.done]]
`;

export const LINREG_PY_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LINREG_PY_POINTER_LABELS = {} as const satisfies Record<string, string>;
