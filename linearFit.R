d = read.csv("~/Dropbox/Projects/CityHall/data/pop_v_land_area.csv")


mylm = lm(log(d$pop)~log(d$land_area))
summary(mylm)

plot(log(d$land_area),log(d$pop))
abline(10.9,0.44)

m = mylm$coefficients[2]
b = mylm$coefficients[1]

x0 = exp(-b/m)

#log(y) = m*log(x) + b
#y - b = mx
#x = (y - b)/m = -b/m

Coefficients:
     (Intercept)  log(d$land_area)  
         10.8523            0.4386 
         
         
         log(x) = -10.9/0.44
         x = exp(-10.9/0.44)