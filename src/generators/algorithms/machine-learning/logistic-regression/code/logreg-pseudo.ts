export const LOGREG_PSEUDO =
` // Logistic Regression via Gradient Descent
 // Minimizes BCE: L = -(1/n) Σ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]

 [[log.data]]function fit(X1, X2, Y, lr, epochs):[[/log.data]]
   [[log.init]]w1, w2, b = 0, 0, 0[[/log.init]]

   [[log.epoch]]for epoch in range(epochs):[[/log.epoch]]

     [[log.predict]]for each point i:
       [[log.predict.step]]z = w1 * X1[i] + w2 * X2[i] + b
       ŷ[i] = 1 / (1 + exp(-z))[[/log.predict.step]][[/log.predict]]

     [[log.loss]]loss = 0
     for each point i:
       [[log.loss.step]]loss -= y[i]·log(ŷ[i]) + (1-y[i])·log(1-ŷ[i])[[/log.loss.step]]
     [[log.loss.avg]]loss /= n[[/log.loss.avg]][[/log.loss]]

     [[log.grad]]dw1, dw2, db = 0, 0, 0
     for each point i:
       [[log.grad.step]]err = ŷ[i] - y[i]
       dw1 += err * X1[i]
       dw2 += err * X2[i]
       db  += err[[/log.grad.step]]
     [[log.grad.scale]]dw1 /= n;  dw2 /= n;  db /= n[[/log.grad.scale]][[/log.grad]]

     [[log.update]]w1 -= lr * dw1
     w2 -= lr * dw2
     b  -= lr * db[[/log.update]]

   [[log.done]]return w1, w2, b[[/log.done]]
`;

export const LOGREG_PSEUDO_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LOGREG_PSEUDO_POINTER_LABELS = {} as const satisfies Record<string, string>;
