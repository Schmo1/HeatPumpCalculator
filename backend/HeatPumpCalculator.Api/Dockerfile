# ---------- Build-Stage ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# csproj zuerst restoren (Layer-Caching)
COPY HeatPumpCalculator.Api.csproj ./
RUN dotnet restore HeatPumpCalculator.Api.csproj

# Restlicher Code + Publish
COPY . ./
RUN dotnet publish HeatPumpCalculator.Api.csproj -c Release -o /app --no-restore

# ---------- Runtime-Stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# SQLite-Datei liegt im Volume /data
RUN mkdir -p /data
ENV ASPNETCORE_URLS=http://+:8080
ENV ConnectionStrings__Default="Data Source=/data/heatpump.db"
EXPOSE 8080

ENTRYPOINT ["dotnet", "HeatPumpCalculator.Api.dll"]
