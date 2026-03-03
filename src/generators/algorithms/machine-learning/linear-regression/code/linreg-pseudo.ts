export const LINREG_PSEUDO =
` // Linear Regression via Gradient Descent
 // Minimizes MSE: L = (1/n) Σ(yᵢ - ŷᵢ)²

 [[reg.data]]function fit(X, Y, lr, epochs):[[/reg.data]]
   [[reg.init]]m, b = 0, 0[[/reg.init]]

   [[reg.epoch]]for epoch in range(epochs):[[/reg.epoch]]

     [[reg.predict]]for each point i:
       [[reg.predict.step]]ŷᵢ = m * xᵢ + b[[/reg.predict.step]][[/reg.predict]]

     [[reg.loss]]loss = 0
     for each point i:
       [[reg.loss.step]]loss += (yᵢ - ŷᵢ)²[[/reg.loss.step]]
     [[reg.loss.avg]]loss /= n[[/reg.loss.avg]][[/reg.loss]]

     [[reg.grad]]dm, db = 0, 0
     for each point i:
       [[reg.grad.step]]dm += xᵢ * (yᵢ - ŷᵢ)
       db += (yᵢ - ŷᵢ)[[/reg.grad.step]]
     [[reg.grad.scale]]dm *= -2/n
     db *= -2/n[[/reg.grad.scale]][[/reg.grad]]

     [[reg.update]]m = m - lr * dm
     b = b - lr * db[[/reg.update]]

   [[reg.done]]return m, b[[/reg.done]]
`;

export const LINREG_PSEUDO_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LINREG_PSEUDO_POINTER_LABELS = {} as const satisfies Record<string, string>;
